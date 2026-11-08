declare module "*.svg";

declare module "*.jpg" {
	const path: string;
	export default path;
}
