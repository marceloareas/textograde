import { ReactElement, useMemo, useState } from "react";
import { Root } from "./styles";
import { Input } from "antd";
const { Search } = Input;
import _ from "lodash";

interface ISearchInputProps {
    onChange: (value: string) => void;
    initialValue?: string;
    placeholder?: string;
}

export const SearchInput = ({ onChange, initialValue = "", placeholder = "" }: ISearchInputProps): ReactElement => {
    const [value, setValue] = useState<string>(initialValue);

    const sendCommand = useMemo(
        () =>
            _.debounce(async (newValue: string) => {
                onChange(newValue);
            }, 500),
        [onChange]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value;
        setValue(newValue);
        sendCommand(newValue);
    };
    
    return (
        <Root>
            <Search 
                placeholder={placeholder}
                value={value}
                allowClear
                onChange={handleChange}
                style={{ width: 250 }}
                />
        </Root>
    );
}