import { PARAMS_URL } from '@/constants/params.constant';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useControlParams = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateURLParams = async (name: string, value: string | number) => {
    const newValue = typeof value === 'number' ? value.toString() : value;

    const params = new URLSearchParams(searchParams);

    if (!newValue) {
      params.delete(name);
    } else {
      params.set(name, newValue);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const updateSearchQuery = (updatedQuery: any, isPage?: boolean) => {
    const keys = Array.from(new Set(searchParams.keys()));

    // Xây dựng currentParams, lưu ý xử lý các key trùng lặp
    const currentParams: { [key: string]: string | string[] } = {};
    keys.forEach((key) => {
      const values = searchParams.getAll(key);
      // Nếu key có nhiều giá trị, lưu dưới dạng mảng
      // Nếu chỉ có một giá trị, lưu dưới dạng string
      currentParams[key] = values.length > 1 ? values : values[0];
    });
    // console.log('Current params before update:', currentParams)

    const combinedParams = {
      ...currentParams,
      ...updatedQuery,
    };

    // console.log('updatedQuery', updatedQuery, 'combinedParams', combinedParams)

    const params = new URLSearchParams();

    Object.entries(combinedParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        // Do nothing
      } else if (Array.isArray(value)) {
        params.delete(key);
        value
          .filter((item) => item !== null && item !== undefined && item !== '')
          .forEach((item) => {
            params.append(key, String(item));
          });
      } else if (typeof value === 'object') {
        params.set(key, JSON.stringify(value));
      } else {
        params.set(key, String(value));
      }
    });

    if (!isPage) {
      params.set(PARAMS_URL.PAGE, '1');
    }

    const queryString = params.toString();
    const updatedPath = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(updatedPath);
  };

  return {
    searchParams,
    updateURLParams,
    updateSearchQuery,
  };
};
