import styled from "styled-components";

export const Root = styled.div`
    padding: 30px;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 400px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #eaeaea;
    overflow: auto;

    div {
        height: 100%;
    }

    p {
        line-height: 20px;
    }

    .tiptap {
        height: 100%;

        &:first-child {
            margin-top: 0;
        }

        > p {
            margin: 0;

            &:first-of-type {
                font-size: 24px;
                font-weight: 700;
                line-height: 32px;
                margin-bottom: 10px;
                padding: 0;
                color: #000;
            }
        }

    }

    .ProseMirror {
        &:focus {
            outline: none;
        }
    }
`;
