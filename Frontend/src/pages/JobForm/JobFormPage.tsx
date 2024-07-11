import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import axios from "axios";
import z from "zod";
import {FieldValues, useForm} from "react-hook-form";
import {zodResolver} from '@hookform/resolvers/zod';
import {NavBar} from "@/components/shared/NavBar/NavBar.tsx";
import {InputItem} from "@/components/shared/InputItems/InputItem.tsx";
import {FaBusinessTime} from "react-icons/fa";
import {FaLocationDot} from "react-icons/fa6";
import {Separator} from "@/components/ui/separator.tsx";
import {Button} from "@/components/ui/button.tsx";
import {MdFormatAlignRight, MdOutlineErrorOutline} from "react-icons/md";
import {AiOutlineLoading3Quarters} from "react-icons/ai";
import {CgUnavailable} from "react-icons/cg";
import {Job, JobApplication} from "@/assets/Data/interfaces.ts";


const getJobApplication = async (jobId: string) => {
    try {
        const job = await axios.get(`http://localhost:4000/jobs/${jobId}`)
        return job.data
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'message' in error) {
            console.log((error as Error).message);
        }
    }
}

const questionErrorMsg: string = "Answer should consist of more than 10 letters";

const schema = z.object({
    name: z.string(),
    question0: z.string().min(10, {message: questionErrorMsg}),
    question1: z.string().min(10, {message: questionErrorMsg}),
    question2: z.string().min(10, {message: questionErrorMsg}),
});

export const JobFormPage: React.FC = () => {
    const [job, setJob] = useState<Job | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)

    const {register, handleSubmit, formState: {errors}, reset} = useForm({resolver: zodResolver(schema)});
    const {jobId} = useParams<{ jobId: string }>()

    useEffect(() => {
        setIsLoading(true)
        if (jobId) {
            getJobApplication(jobId)
                .then((data) => setJob(data))
                .catch(() => setIsError(true))
                .finally(() => setIsLoading(false))
        }
    }, [jobId])

    const onSubmit = async (data: FieldValues) => {
        console.log(data);
        if(jobId) {
            const jobApplication: JobApplication = {
                fullName: data.name,
                answers: [data.question0, data.question1, data.question2],
                job: jobId
            }
            try {
                const response = await axios.post("http://localhost:4000/jobApplication",JSON.stringify(jobApplication),{
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                if(response.status === 201){
                    alert("application saved")
                }else{
                    alert("application saving failed")
                }
            }catch (error){
                console.log(error)
            }

            console.log(jobApplication)
        }
        reset();
    }

    return (
        <>
            <NavBar title={"Job Form"} icon={<MdFormatAlignRight className="opacity-70" size={30}/>}/>
            <div className="px-44">
                {isLoading ? (
                    <div className="flex justify-center items-center  w-full ">
                        <AiOutlineLoading3Quarters size={40} className="animate-spin"/>
                    </div>
                ) : isError ? (
                    <div className="flex justify-center items-center  w-full ">
                        <MdOutlineErrorOutline size={40}/>
                        <h2>Error while fetching data</h2>
                    </div>
                ) : !job ? (
                    <div className="flex justify-center items-center  w-full ">
                        <CgUnavailable size={40} className=" opacity-60"/>
                        <h2 className="text-2xl opacity-60">Jobs unavailable</h2>
                    </div>
                ) : (
                    <>
                        <h1 className="text-4xl mt-14">{job.title}</h1>
                        <div className="flex items-center gap-x-14 mt-5">
                            <div className="flex gap-x-5">
                                <FaBusinessTime size="30"/>
                                <h2 className="text-xl">{job.type}</h2>
                            </div>
                            <div className="flex gap-x-4">
                                <FaLocationDot size="25"/>
                                <h2 className="text-xl">{job.location}</h2>
                            </div>
                        </div>
                        <h2 className="text-lg pe-40 mt-8 mb-10">{job.description}</h2>
                        <Separator/>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="mt-16">
                                <InputItem id="name" inputType="input" title="Full Name"
                                           required={true} register={register} error={errors.name}/>
                            </div>
                            {job.questions.map((question, index) => (
                                <div className="mt-16" key={`question${index}`}>
                                    <InputItem id={`question${index}`} inputType="textArea" title={question}
                                               required={true} register={register} error={errors[`question${index}`]}/>
                                </div>
                            ))}
                            <div className="flex gap-x-5 mt-10 ">
                                <Button type="submit" className="text-xl mb-16">Submit</Button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </>
    );
};