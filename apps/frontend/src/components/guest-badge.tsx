export default function GuestBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className='rounded-md bg-foreground/5 px-2 py-1 text-sm'>
      {children}
    </span>
  );
}
