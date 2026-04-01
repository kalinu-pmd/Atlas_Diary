import Jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

const decodeAuthToken = (token) => {
	if (!token) return null;
	const isCustomAuth = token.length < 500;
	if (isCustomAuth) {
		const decodedData = Jwt.verify(token, JWT_SECRET);
		return decodedData?.id || null;
	}
	const decodedData = Jwt.decode(token);
	return decodedData?.sub || null;
};

const auth = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		req.userId = decodeAuthToken(token);
		if (!req.userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}
		next();
	} catch (error) {
		return res.status(401).json({ message: "Unauthorized" });
	}
};

export const optionalAuth = async (req, _res, next) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];
		req.userId = decodeAuthToken(token);
	} catch (_error) {
		req.userId = undefined;
	}
	next();
};

export default auth;
