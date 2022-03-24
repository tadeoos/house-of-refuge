import styled from 'styled-components';

const StyledExternalLink = styled.a`
  color: #005EAA;
  text-decoration: none;

  :hover {
    opacity: 0.66;
  }
`;

const ExternalLink = ({link, text}) => {
    return (
        <StyledExternalLink
            target="_blank"
            rel="noopener noreferrer"
            href={link}>
            {text}
        </StyledExternalLink>
    );
};

export default ExternalLink;
