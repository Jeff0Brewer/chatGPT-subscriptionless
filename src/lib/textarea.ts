const resizeToFit = (el: HTMLTextAreaElement): void => {
    // set height to 0, overflowing into scroll height
    el.style.height = ''
    // then set height to scroll height
    el.style.height = `${el.scrollHeight}px`
}

export {
    resizeToFit
}
