import jwt from "jsonwebtoken"

/**
 * 解析 JWT 并返回过期时间
 * @param {string} token - 要解析的 JWT 令牌
 * @returns {Object} - 返回包含过期时间和是否过期的字段
 */
export function getExpirationTime(token) {
  try {
    // 解码 JWT，不验证签名
    const decoded = jwt.decode(token, { complete: true });

    if (!decoded || !decoded.payload || !decoded.payload.exp) {
      return {
        error: '无效的 Token 或缺少 exp 字段',
        isExpired: true
      };
    }

    const exp = decoded.payload.exp; // 过期时间（Unix 时间戳）
    const isExpired = Date.now() >= exp * 1000; // 检查是否过期

    return {
      exp: exp,
      isExpired: isExpired
    };
  } catch (err) {
    return {
      error: '解析 Token 失败',
      isExpired: true
    };
  }
}
