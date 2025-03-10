import { Menu, MenuProvider, GroupMenuProvider } from 'ice-common';
import { configuration } from 'ice-core'

type MenuGroupInfo = {
    backstage: string,
    icon: React.ReactNode,
    text: string,
    homePath: string,
    defaultOpenNames?: Array<string>,
    allow?: () => boolean,
    initFun?: () => (Promise<void> | void),
    part?: React.ReactNode | Array<React.ReactNode>,
}

class MenuProviderEx extends GroupMenuProvider {
    // 路由前缀
    public preRoute = `${configuration.pcRouterPre}/back`;

    // 当前后台
    public backstage: string = 'admin';

    // 菜单
    protected mapMenus = new Map<string, MenuProvider>();

    public menuGroupInfos = new Array<MenuGroupInfo>();

    public globalParts = new Array<React.ReactNode>();

    constructor() {
        super();
    }

    registerMenuGroup(params: MenuGroupInfo & {
        globalPart?: React.ReactNode
    }) {
        this.mapMenus.set(params.backstage, new MenuProvider(`${this.preRoute}/${params.backstage}`));
        this.menuGroupInfos.push(params);
        if (params.globalPart) {
            this.globalParts.push(params.globalPart);
        }
    }

    isExistMenuGroup(backstage: string) {
        return this.mapMenus.has(backstage);
    }

    getCurMenuGroupInfo() {
        return this.menuGroupInfos.find(e => e.backstage == this.backstage);
    }

    getHomeUrl(backstage: string = this.backstage) {
        var menuGroupInfo = this.menuGroupInfos.find(e => e.backstage == backstage)!;
        return `${this.preRoute}/${menuGroupInfo.backstage}${menuGroupInfo.homePath}`;
    }
}

export default new MenuProviderEx();