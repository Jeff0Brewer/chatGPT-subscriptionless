type PostBody = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: string
}

const jsonPostBody = (data: object): PostBody => {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
}

export {
    jsonPostBody
}
