export interface Job {
    _id: string
    title: string
    type: string
    description: string
    location: string
    questions: string[]
}

export interface JobApplication {
    _id?: string
    fullName: string
    answers: string[]
    job:string
}