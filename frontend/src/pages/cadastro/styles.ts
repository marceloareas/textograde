import styled from "styled-components";

export const FormWrapper = styled.form`
    padding: 20px 40px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    width: 350px;
    max-height: 400px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

export const CheckboxGroup = styled.div`
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

export const InputWrapper = styled.div`
    margin-bottom: 20px;
    width: 100%;
`;

export const CenteredButton = styled.div`
    display: flex;
    width: 100%;
    text-align: center;
    justify-content: space-between;
`;