import { motion } from "framer-motion";
import styled from "styled-components"

type ButtonColorProps = {
  danger?: boolean;
}

interface PillButtonProps extends ButtonColorProps {};

export const PillButton = styled(motion.button).attrs({
  whileHover: {
    scale: 1.02,
  },
})<PillButtonProps>`
  display: flex;
  align-items: center;
  gap: 2px;
  border-radius: 50px;
  border: none;
  padding: 5px 10px 5px 10px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.5s;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.26);
  color: white;
  font-size: 13px;
  transition: background-color 0.2s;

  ${props => props.danger && 'background: #ff262680;'};
  ${props => props.danger === false && 'background: #1db95480;'};


  &:hover {
    opacity: 0.8;
  }
`;