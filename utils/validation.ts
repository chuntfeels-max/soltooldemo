/**
 * 验证 Solana 钱包地址格式
 * Solana 地址通常是 base58 编码，长度为 32-44 个字符
 */
export const isValidSolanaAddress = (address: string): boolean => {
  const cleanAddr = address.trim();
  // Solana 地址长度通常在 32-44 字符之间
  // 更严格的验证可以使用 base58 字符集检查
  return cleanAddr.length >= 32 && cleanAddr.length <= 44;
};

/**
 * 格式化地址显示（显示前8位和后6位）
 */
export const formatAddress = (address: string, start: number = 8, end: number = 6): string => {
  if (!address || address.length < start + end) {
    return address;
  }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

/**
 * 复制到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // 降级方案：使用传统方法
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy method also failed:', fallbackError);
      return false;
    }
  }
};

