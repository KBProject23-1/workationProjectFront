// 서버가 내려준 파일을 브라우저 다운로드로 넘긴다
export function useFileDownload() {
  // Content-Disposition 의 filename*=UTF-8'' 를 먼저 보고, 없으면 filename 을 쓴다
  const parseFileName = (disposition, fallback) => {
    if (!disposition) return fallback;

    const utf8 = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8) return decodeURIComponent(utf8[1]);

    const plain = disposition.match(/filename="?([^";]+)"?/i);
    return plain ? plain[1] : fallback;
  };

  const download = (response, fallbackName) => {
    const disposition =
      response.headers?.['content-disposition'] ??
      response.headers?.get?.('content-disposition');

    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = parseFileName(disposition, fallbackName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return { download };
}
