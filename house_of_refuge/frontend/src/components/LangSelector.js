import styled from 'styled-components'

const StyledLangSelector = styled.div`
  margin-right: 34px;
  color: #898F9C;
  cursor: pointer;
  font-size: 15px;
  
  @media (max-width: 600px) {
    margin-right:  18px;
  }

  svg {
    opacity: 0.8;
    margin-top: 3px;
    margin-left: 3px;
    width: 14px;
    fill: #898F9C;
  }

`

const LangSelector = ({ className }) => {

    return (
        <StyledLangSelector className={className}>
            <span> Polski </span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -0.8 12 12" >
                <polygon id="XMLID_29_" className="st0" points="9.8,3.3 6,7.1 2.2,3.3 1.2,4.3 6,9 10.8,4.3 " />
            </svg>
        </StyledLangSelector>
    )
}

export default LangSelector 
