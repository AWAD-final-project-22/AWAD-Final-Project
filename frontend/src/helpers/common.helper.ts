export const serializedParamsQuery = (params: Record<string, any>) => {
  const serializedParams = new URLSearchParams();

  Object.keys(params).forEach((key) => {
    const value = params[key];

    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        serializedParams.append(
          key,
          typeof item === 'string' ? item : JSON.stringify(item),
        );
      });
    } else {
      serializedParams.append(
        key,
        typeof value === 'string' ? value : JSON.stringify(value),
      );
    }
  });

  return serializedParams;
};
