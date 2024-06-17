import { cn } from '@repo/lib'

export default async function Page() {
    return (
        <p className={cn(['bg-red-500', 'blur-md'])}>Hello World</p>
    )
}