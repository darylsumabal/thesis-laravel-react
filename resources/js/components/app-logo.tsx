import { AvatarImage } from '@radix-ui/react-avatar';
import { Avatar } from './ui/avatar';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                {/* <AppLogoIcon className="size-5 fill-current text-white dark:text-black" /> */}

                <Avatar>
                    <AvatarImage src="/asset/bisu.png" alt="bisu logo" />
                </Avatar>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">Judging Tabulation</span>
            </div>
        </>
    );
}
