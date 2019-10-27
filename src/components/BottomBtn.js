import React from 'react'
import Proptypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const BottomBtn = ({ text, colorClass, icon, onBtnClick }) => (
    <button
        type="button"
        className={`btn btn-block no-border ${colorClass}`}
        onClick={onBtnClick}
    >
        <FontAwesomeIcon
            className="mr-2"
            icon={icon}
            size="lg"
            title={text}
        />
        {text}
    </button>
)
BottomBtn.propTypes = {
    text: Proptypes.string,
    colorClass: Proptypes.string,
    icon: Proptypes.object.isRequired,
    onBtnClick: Proptypes.func,
}

export default BottomBtn