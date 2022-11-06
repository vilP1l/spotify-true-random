import styled from "styled-components";
import { FaSpotify } from "react-icons/fa";

const Container = styled.div`
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
      <FaSpotify />
      <span>TrueRandom</span>
    </Container>
  )
}