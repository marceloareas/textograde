import styled from "styled-components";

export const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: calc(100vh - 110px);
    overflow: auto;
`;

export const FormWrapper = styled.div`
	width: 400px;
    height: fit-content;
    min-height: 350px;
`;

export const Title = styled.h1`
	text-align: start;
	margin-bottom: 40px;
	font-size: 20px;
	font-weight: 600;
`;
