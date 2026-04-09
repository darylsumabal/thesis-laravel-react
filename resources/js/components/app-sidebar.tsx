import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { usePage } from '@inertiajs/react';
import { BarChart3, BookOpen, Calendar, Calendar1Icon, Folder, Notebook, UserPlus2 } from 'lucide-react';
import AppLogo from './app-logo';

const judgeNavItem: NavItem[] = [
    {
        title: 'Contest',
        href: '/judging/contest-list',
        icon: Calendar1Icon,
    },
];

const mainNavItems: NavItem[] = [
    {
        title: 'Account',
        href: '/account',
        icon: UserPlus2,
    },

    {
        title: 'Event',
        href: '/event/event-list',
        icon: Calendar,
    },
    {
        title: 'Criteria',
        href: '/criteria/criteria-list',
        icon: Notebook,
    },
    {
        title: 'Result',
        href: '/result',
        icon: BarChart3,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const userRole = auth?.user?.accountType || 'JUDGE';
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <div>
                                <AppLogo />
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {userRole === 'JUDGE' && <NavMain items={judgeNavItem} />}
                {userRole === 'ADMIN' && <NavMain items={mainNavItems} />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
