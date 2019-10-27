export const getParentNode = (node, parentClassname) => {
    let current = node
    while (current !== null && current.classList) {
        if (current.classList.contains(parentClassname)) {
            return current
        }
        current = current.parentNode
    }
    return false
}