import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, BookOpen, Calendar, Calendar1Icon, Facebook, Folder, Github, Instagram, Notebook, UserPlus2 } from 'lucide-react';
import AppLogo from './app-logo';

const judgeNavItem: NavItem[] = [
    {
        title: 'Contest',
        href: '/judging/contest-list',
        icon: Calendar1Icon,
    },
];

const mainNavItems: NavItem[] = [
    // {
    //     title: 'Dashboard',
    //     href: '/dashboard',
    //     icon: LayoutGrid,
    // },
    {
        title: 'Account',
        href: '/account',
        icon: UserPlus2,
    },
    // {
    //     title: 'Event',
    //     href: '/event',
    //     icon: Calendar,
    // },
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

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/darylsumabal/thesis-laravel-react',
        icon: Folder,
    },
    {
        title: 'Developer',
        href: 'https://portfolio-daryl.vercel.app/home',
        icon: BookOpen,
    },
    // {
    //     title: 'Github',
    //     href: 'https://github.com/darylsumabal',
    //     icon: Github,
    // },
    // {
    //     title: 'Facebook',
    //     href: 'https://web.facebook.com/legndaryl',
    //     icon: Facebook,
    // },
    // {
    //     title: 'Instagram',
    //     href: 'https://www.instagram.com/legndaryl',
    //     icon: Instagram,
    // },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const userRole = auth?.user?.accountType || 'JUDGE';
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
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
