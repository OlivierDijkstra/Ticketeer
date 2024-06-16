import type { TooltipProps } from 'recharts';
import type {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

interface Props extends TooltipProps<ValueType, NameType> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO: fix any type
  formatter: (value: any) => string;
}

export default function GraphTooltip({
  active,
  payload,
  label,
  formatter,
}: Props) {
  if (active) {
    return (
      <div className='rounded-sm border bg-white px-3 py-2 shadow-sm dark:bg-muted'>
        <ul className='m-0 list-none gap-2 p-0'>
          <li className='mb-1 font-semibold'>{label}</li>

          {payload?.map((item) => (
            <li key={item.dataKey} className='capitalize'>
              <span className='mr-1 font-medium' style={{ color: item.color }}>
                {item.dataKey}:
              </span>
              <span className='text-stone-700 dark:text-stone-300'>
                {formatter(item.value as string)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}
