import styled from 'styled-components'
import { Link } from 'react-router-dom'

export const Option = styled(Link)`
    border: 1px solid #3D2175;
    padding: 5px 10px;
    border-radius: 20px;
    text-decoration: none;
    color: #3D2175;
`

export const MainOption = styled(Option)`
    background-color:#3D2175;
    color:white;
`