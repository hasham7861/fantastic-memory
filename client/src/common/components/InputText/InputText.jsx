import React  from "react"
import PropTypes from 'prop-types';

PropTypes.InputText = {
    textState: PropTypes.string,
    updateTextState: PropTypes.func
}
export function InputText(props){
    const onChangeInputText = (e) =>{
        const newText = e.target.value
        props.updateTextState(newText)
    }
    return <input type="text" value={props.textState} onChange={(e)=>onChangeInputText(e)}/>
} 