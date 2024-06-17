import type { Product } from '@repo/lib';
import { cn } from '@repo/lib'

export default async function Page() {
    const prod: Product = {
        
    };

    return (
        <p className={cn(['bg-red-500', 'blur-md'])}>Hello World</p>
    )
}