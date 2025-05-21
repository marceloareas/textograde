import styled from "styled-components";

export const Content = styled.div`
    display: flex;
    flex-direction: column;

    > h2 {
        font-size: 14px;
        font-weight: 400;
    }
`;

export const DeleteTopicContainer = styled.div`
    font-size: 14px;
    font-weight: 500;
    border: 1px dashed #FF4D4F;
    border-radius: 4px;
    padding: 8px;

    color: #FF4D4F;
`;

export const StyledInput = styled.div`
    display: flex;
    flex-direction: column;

    > label {
        font-size: 12px;
        font-weight: 400;
        color: #999;
    }
`;