"use strict";

class TokenHelper {
    static parseJwtPayload(tokenStr) {
        if (!tokenStr || typeof tokenStr !== "string") return null;
        try {
            // Handle json envelope or raw jwt
            if (tokenStr.startsWith("{")) {
                const parsed = JSON.parse(tokenStr);
                const idToken = parsed.id_token || parsed.access_token || tokenStr;
                return this.parseJwtPayload(idToken);
            }
            const parts = tokenStr.split(".");
            if (parts.length >= 2) {
                const payload = Buffer.from(parts[1], "base64").toString("utf-8");
                return JSON.parse(payload);
            }
        } catch (e) {
            return null;
        }
        return null;
    }

    static extractAccountInfo(tokenStr) {
        const payload = this.parseJwtPayload(tokenStr);
        if (!payload) return null;
        return {
            email: payload.email || null,
            name: payload.name || payload.given_name || null,
            picture: payload.picture || null,
            sub: payload.sub || null
        };
    }
}

module.exports = TokenHelper;
