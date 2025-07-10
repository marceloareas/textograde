import styled from 'styled-components'

export const Title = styled.h1`
    font-family: 'DM Sans', sans-serif;
    font-size: 1.5rem;
    margin-top: 40px;
    text-align: center;
`

export const Root = styled.div`
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
`;

export const Wrapper = styled.div`
    padding: 0 50px;
    max-width: 900px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    > label {
        margin-bottom: 20px;
    }
`

export const ButtonWrapper = styled.div`
    display: flex;
    margin-top: 20px;
    width: 100%;
    justify-content: space-between;
`

export const UploadWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;

    input[type="file"] {
        margin-right: 10px;
    }
`