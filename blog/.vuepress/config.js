module.exports = {
    title: "Coding Adventures",
    theme: "@vuepress/blog",
    markdown: {
        lineNumbers: true,
    },
    themeConfig: {
        smoothScroll: true,
        nav: [
            {
                text: "Blog",
                link: "/",
            },
            {
                text: "About Me",
                link: "/2020/04/19/intro/",
            },
            {
                text: "Tags",
                link: "/tag/",
            },
            {
                text: "DotnetCore",
                link: "/tag/dotnet/",
            },
            // {
            //     text: "Reactjs",
            //     link: "/tag/reactjs/",
            // },
        ],
        comment: {
            service: "disqus",
            shortname: "coding-adventures",
        },

        footer: {
            contact: [
                {
                    type: "github",
                    link: "https://github.com/Bilalharoon",
                },
                {
                    type: "linkedin",
                    link: "https://www.linkedin.com/in/bilalharoon1604/",
                },
                {
                    type: "mail",
                    link: "mailto:bilal.a.haroon@gmail.com",
                },
                {
                    type: "codepen",
                    link: "https://codepen.io/BilalH/pens/public",
                },
            ],
        },
    },
};
