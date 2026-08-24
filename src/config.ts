import type {
	ExpressiveCodeConfig,
	FriendsConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "MatserNoah's Box",
	subtitle: "A naive playground for TRPG, CyberSecurity and more...?",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: true, // Hide the theme color picker for visitors
	},
	banner: {
		enable: true,
		src: "assets/images/banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 3, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		{
			name: "友链&外链",
			url: "/links/", // Internal links should not include the base path, as it is automatically added
		},
		{
			name: "特设页面",
			url: "",
			children: [
				{ name: "古城幻谭", url: "/special/古城幻谭/" },
				{ name: "马鹿的奇妙旅行", url: "/special/马鹿的奇妙旅行/" },
			],
		},
		{
			name: "在线工具",
			url: "",
			children: [
				{ name: "COC车卡工具", url: "/tools/coc-investigator-wizard.html" },
				{ name: "TRPG控音台", url: "/tools/trpg-sound-console.html"},
				{ name: "七伏市集章中文版", url: "/tools/nanafuseshi_stamp.html"}
			],
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "MasterNoah",
	bio: "A Somewhat Rusty Idealist",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/noahbox",
		},
		{
			name: "Dicecho",
			icon: "fa6-solid:dice",
			url: "https://next.dicecho.com/en/account/6048c166aed4d4001dfe89e6",
		},
		{
			name: "QQ",
			icon: "fa6-brands:qq",
			url: "https://qm.qq.com/q/PbaSVM8Fai"
		}
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};

export const friendsConfig: FriendsConfig = {
	friends: [
		{
			name: "我的GitHub",
			url: "https://github.com/noahbox",
			avatar: "https://avatars.githubusercontent.com/u/86278943",
			description: "NoahTie/MasterNoah的GitHub",
			category: "个人主页",
		},
		{
			name: "我的Dicecho主页",
			url: "https://next.dicecho.com/en/account/6048c166aed4d4001dfe89e6",
			avatar: "https://file.dicecho.com/mod/6048c166aed4d4001dfe89e6/MasterNoah.png",
			description: "MasterNoah的Dicecho主页",
			category: "个人主页",
		},
		{
			name: "煎蛋躺在平底锅的Dicecho主页",
			url: "https://next.dicecho.com/zh/account/68b5750db6d8e90f7e45f2cb",
			avatar: "https://file.dicecho.com/mod/68b5750db6d8e90f7e45f2cb/未命名作品 1的副本.png",
			description: "龙蛋物语&三角机构&最终物语剧本作者。伟大，无需多言。",
			category: "友链",
		},
		{
			name: "りゅうたま　公式ブログ",
			url: "https://ryu0tama.blog.shinobi.jp/",
			avatar: "https://www.monodraco.com/assets/img/member/img_member08.png",
			description: "龙蛋物语日文版官方博客，由规则书作者本人维护。",
			category: "外部链接",
		},
		{
			name: "乐博睿/Labyrinth",
			url: "https://labyrinth-rpg.com/%E9%BE%99%E8%9B%8B%E7%89%A9%E8%AF%AD",
			avatar: "https://img1.wsimg.com/isteam/ip/4d66e3af-0d8e-4ef0-8c20-8f3cfe7215d8/%E4%B8%AD%E6%96%87logo.jpg",
			description: "龙蛋物语简体中文版官网",
			category: "外部链接",
		},
		{
			name: "KOTODAMA HEAVY INDUSTRY - Ryuutama",
			url: "https://kotohi.com/ryuutama/",
			avatar: "https://kotohi.com/wp-content/uploads/2013/10/Kotodama-Logo_full.jpg",
			description: "龙蛋物语英文版官网",
			category: "外部链接",
		},
		{
			name: "魔都TRPG",
			url: "https://www.cnmods.net/web/",
			avatar: "https://wiki.cnmods.org/_media/logo.png",
			description: "魔都cnmods是国内中文TPRG模组共享交流网站，跑团玩家集散地，现今共收录众多原创或翻译模组，主要规则类别为COC7th，即克苏鲁的呼唤第7版规则，同时也收录了例如DND、PF等其他规则的模组。",
			category: "外部链接",
		},
		{
			name: "纯美苹果园",
			url: "https://www.goddessfantasy.net",
			description: "",
			category: "外部链接",
		},
	],
};
