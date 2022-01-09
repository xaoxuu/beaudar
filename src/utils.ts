import { Thresholds, FormatOptions, RepoRegex } from './constant-data';
import { PageAttrs } from './type-declare';

export const timeAgo = (current: number, value: Date) => {
  const elapsed = current - value.getTime();
  if (elapsed < 5000) {
    return ' 刚刚';
  }
  let i = 0;
  while (i + 2 < Thresholds.length && elapsed * 1.1 > Thresholds[i + 2]) {
    i += 2;
  }

  const divisor = Thresholds[i] as number;
  const text = Thresholds[i + 1] as string;
  const units = Math.round(elapsed / divisor);

  if (units > 3 && i === Thresholds.length - 2) {
    return `于 ${value.toLocaleDateString(undefined, FormatOptions)}`;
  }
  return units === 1 ? `于 1 ${text}前` : `于 ${units} ${text}前`;
};

export const loadTheme = (theme: string, origin: string, keepTheme: string) => {
  document.documentElement.setAttribute('theme', theme);

  addEventListener('message', (event) => {
    if (JSON.parse(keepTheme)) {
      sessionStorage.setItem('beaudar-set-theme', event.data.theme);
    }
    if (event.origin === origin && event.data.type === 'set-theme') {
      document.documentElement.setAttribute('theme', event.data.theme);
    }
  });
};

export const decodeBase64UTF8 = (encoded: string) => {
  encoded = encoded.replace(/\s/g, '');
  return decodeURIComponent(window.atob(encoded));
};

export const decodeParam = (query: string): Record<string, string> => {
  let match: RegExpExecArray | null;
  const plus = /\+/g;
  const search = /([^&=]+)=?([^&]*)/g;
  const decode = (s: string) => decodeURIComponent(s.replace(plus, ' '));
  const params: Record<string, string> = {};
  // tslint:disable-next-line:no-conditional-assignment
  while ((match = search.exec(query))) {
    params[decode(match[1])] = decode(match[2]);
  }
  return params;
};

export const param = (obj: Record<string, string>) => {
  const parts = [];
  for (const name in obj) {
    if (obj.hasOwnProperty(name) && obj[name]) {
      parts.push(
        `${encodeURIComponent(name)}=${encodeURIComponent(obj[name])}`,
      );
    }
  }
  return parts.join('&');
};

export const readPageAttributes = (location: Location): PageAttrs => {
  const params = decodeParam(location.search.substring(1));

  let issueTerm: string | null = null;
  let issueNumber: number | null = null;
  if ('issue-term' in params) {
    issueTerm = params['issue-term'];
    if (issueTerm !== undefined) {
      if (issueTerm === '') {
        throw new Error('指定的 issue-term 不能为空');
      }
      if (['title', 'url', 'pathname', 'og:title'].indexOf(issueTerm) !== -1) {
        if (!params[issueTerm]) {
          throw new Error(`找不到 "${issueTerm}" 这个 issue 的信息`);
        }
        issueTerm = params[issueTerm];
      }
    }
  } else if ('issue-number' in params) {
    issueNumber = +params['issue-number'];
    if (issueNumber.toString(10) !== params['issue-number']) {
      throw new Error(`issue-number 无效，${params['issue-number']}`);
    }
  } else {
    throw new Error('"issue-term" 或 "issue-number" 是必须项');
  }

  if (!('repo' in params)) {
    throw new Error('仓库 "repo" 是必须项');
  }

  if (!('origin' in params)) {
    throw new Error('来源 "origin" 是必须项');
  }

  const matches = RepoRegex.exec(params.repo);
  if (matches === null) {
    throw new Error(`无效的仓库 repo: "${params.repo}"`);
  }

  return {
    owner: matches[1],
    repo: matches[2],
    branch: params.branch || 'master',
    issueTerm,
    issueNumber,
    origin: params.origin,
    url: params.url,
    title: params.title,
    description: params.description,
    label: params.label,
    theme: params.theme || 'github-light',
    keepTheme: params['keep-theme'] || 'true',
    loading: params.loading || 'true',
    commentOrder: params['comment-order'] || 'asc',
    inputPosition: params['input-position'] || 'bottom',
    session: params.session,
  };
};

// 设置评论者列表用于 @
export const setCommentUserList = (userLogin: string | undefined) => {
  if (!userLogin) {
    return;
  }
  let commentUserList = JSON.parse(
    sessionStorage.getItem('commentUserList') as string,
  );
  if (!commentUserList) {
    commentUserList = [];
  }

  if (!commentUserList.includes(`@${userLogin}`)) {
    commentUserList.push(`@${userLogin}`);
    sessionStorage.setItem('commentUserList', JSON.stringify(commentUserList));
  }
};