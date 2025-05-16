function FormatUrlString(path: any) {
    const arrPath: any[] = [];

    Object.keys(path).forEach(item => arrPath.push(`${item}=${path[item]}`));

    return arrPath.join("&");
}

export function UrlQueryControl(prefix: string, path: any, newQueries: any): string {
    let newPath;

    newQueries?.forEach((item: any) => {
        if (path[item.key]) {
            // eslint-disable-next-line no-param-reassign
            path[item.key] = item.value;
            newPath = FormatUrlString(path);
        } else {
            Object.assign(path, { [item.key]: item.value });
            newPath = FormatUrlString(path);
        }
    });

    return `/${prefix}?${newPath}`;
}
