import { useState, useEffect } from 'react'

const useFileFilter = (files, id, value, prop) => {
    const newFiles = (files || []).map(file => {
        if (file.id === id) {
            file[prop] = value
        }
        return file
    })
    return newFiles
}

export default useFileFilter