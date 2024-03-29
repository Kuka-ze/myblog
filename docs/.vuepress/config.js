module.exports = {
    title: '好看的博客',
    head: [ // 注入到当前页面的 HTML <head> 中的标签
        ['link', { rel: 'icon', href: './vue.png' }],  // 网页标签图标
    ],
    serviceWorker: true, // 是否开启 PWA
    themeConfig: {
        logo: '/vue.png',
        nav: [ // 导航栏配置
            { text: '首页', link: '/' },
            {
                text: '技术文档',
                items: [
                    { text: 'PAT', link: '/coding/pat/' },
                    { text: '剑指offer', link: '/coding/offer/' },
                    { text: 'LeeCode', link: '/coding/leeCode/' }
                ]
            },
            {
                text: '面试',
                items: [
                    { text: 'vue', link: '/tech/vue/' },
                    { text: 'react', link: '/tech/react/' },
                ]
            },
            { text: 'git常用命令行', link: '/gitcode/gitcode/', },
            { text: '手写源码', link: '/tech/interview/', },
            { text: 'csdn', link: 'https://blog.csdn.net/ze1024' },

        ],
        sidebar: 'auto', // 侧边栏配置
    },
};