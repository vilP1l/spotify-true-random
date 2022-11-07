import styled from "styled-components";

export default styled.a.attrs({
  target: '_blank',
  rel: 'noopener noreferrer',
})`
  cursor: pointer;
  border-bottom: 2px solid;
  border-color: rgba(255, 255, 255, 0.5);
  transition: border-color 0.2s;

  :hover {
    border-color: rgba(255, 255, 255, 0.4);
  }
`;