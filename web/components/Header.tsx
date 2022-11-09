import styled from "styled-components";

const Container = styled.header`
  display: flex;
  align-items: center;
  gap: 2px;
  position: absolute;
  top: 0;
  margin-top: 2em;

  span {
    font-weight: 500;
  }
`;

export default function Header() {
  return (
    <Container>
      <span>TrueShuffle</span>
    </Container>
  )
}