import { Config } from "@remotion/cli/config";

// Qualite de rendu maximale par defaut.
// Le passage 4K/8K se fait via --scale au rendu (voir scripts package.json),
// pour ne pas alourdir la preview du Studio.
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setCodec("h264");
Config.setCrf(16); // 0 = sans perte, 51 = pire. 16 = tres haute qualite.
Config.setChromiumDisableWebSecurity(true); // autorise le fetch d'images distantes (Pexels/Unsplash) au rendu
Config.setOverwriteOutput(true);
