import './CreateTheory.scss'
import React, {useEffect, useRef, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../../redux/hooks";
import {useNavigate, useParams} from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import {
    createTheoryChapter,
    createTheoryIntro,
    createTheoryLab,
    getTheoryDetail,
    IntroType,
    LabType,
    setSelectedChapter,
    updateChapter,
    updateIntro,
    updateLab
} from "../../../../redux/reducers/coursesReducer";
import {getSelectedChapterSelector, getTheoryDetailSelector} from "../../../../redux/selectors/coursesSelectors";
import {message, Switch, Upload} from 'antd';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {EDITOR_JS_TOOLS} from '../../../../redux/selectors/constants';
import EditorJs from 'react-editor-js';
import {isSidebar} from "../../../../redux/reducers/authorizationReducer";
import Preloader from "../../../../landing/components/Preloader/Preloader";
import {getPermission} from "../../../../redux/selectors/authorizationSelectors";

const CreateTheory = React.memo(() => {
        const dispatch = useAppDispatch()
        const params: any = useParams()
        const navigate = useNavigate()
        const permission = useAppSelector(state => getPermission(state))
        const [isModalVisible, setIsModalVisible] = useState(false);
        const theoryDetail = useAppSelector(state => getTheoryDetailSelector(state))
        const selectedChapters = useAppSelector(state => getSelectedChapterSelector(state))
        const [imgIntro, setImgIntro] = useState()
        const [imgIntroFile, setImgIntroFile] = useState()
        const [isControl, setIsControl] = useState(false)
        const [isProject, setIsProject] = useState(false)
        const [typeLab, setTypeLab] = useState(0)
        const [minPoints, setMinPoints] = useState()
        let request: any = {}
        let savedData: any

        const {register, handleSubmit, setValue, control, formState: {errors}} = useForm<any>({});
        const onSubmitIntro: SubmitHandler<IntroType> = (data): any => {
            request = {...data}
            request.theory = params.id
            request.image = imgIntroFile
            request.id = selectedChapters.id
            if (!theoryDetail.intro && selectedChapters.type === 'Theory Intro') {
                dispatch(createTheoryIntro(request)).then(() => {
                    dispatch(getTheoryDetail(params.id))
                    setValue("title", '')
                    message.success('?????????? ?????????????? ??????????????')
                })
            } else if (selectedChapters.title && selectedChapters.type === 'Theory Intro') {
                dispatch(updateIntro(request)).then(() => {
                    message.success('?????????? ?????????????? ??????????????????')
                    dispatch(getTheoryDetail(params.id))
                    //setValue("title", '')
                })
            } else if (!selectedChapters.title && selectedChapters.type === 'Theory Chapter') {
                dispatch(createTheoryChapter(request)).then(() => {
                    message.success('?????????? ?????????????? ??????????????')
                    dispatch(getTheoryDetail(params.id))
                    setValue("title", '')
                })
            } else if (selectedChapters.title && selectedChapters.type === 'Theory Chapter') {
                dispatch(updateChapter(request)).then(() => {
                    message.success('?????????? ?????????????? ??????????????????')
                    dispatch(getTheoryDetail(params.id))
                    //setValue("title", '')
                })
            }
        }
        const onSubmitLab: SubmitHandler<LabType> = (data: any) => {
            request = {...data}
            request.theory = params.id
            request.control = isControl
            request.project = isProject
            request.id = selectedChapters.id
            request.type = typeLab
            request.embed = data.embed === '' ? null : data.embed
            if (!selectedChapters.title && selectedChapters.type === 'Theory Lab') {
                dispatch(createTheoryLab(request)).then(() => {
                    dispatch(getTheoryDetail(params.id))
                    message.success('???????????????????????? ?????????????? ??????????????')
                })
            } else if (selectedChapters.title && selectedChapters.type === 'Theory Lab') {
                dispatch(updateLab(request)).then(() => {
                    dispatch(getTheoryDetail(params.id))
                    message.success('???????????????????????? ?????????????? ??????????????????')
                })
            }
        }
        const uploadImgIntro = {
            accept: '.png, .jpg, .jpeg',
            showUploadList: false,
            name: 'file',
            multiple: false,
            customRequest: (file: any) => {
                setImgIntroFile(file.file)
                let reader: any = new FileReader();
                let url = reader.readAsDataURL(file.file);
                reader.onloadend = () => {
                    setImgIntro(reader.result)
                }
            }
        }
        let switchHandler = (e: any) => {
            e ? setTypeLab(1) : setTypeLab(0)
        }
        const instanceRef: any = useRef(null)
        const instanceLabRef: any = useRef(null)
        let handleSaveTheory = async () => {
            savedData = await instanceRef.current.save()
        }
        let handleSaveLab = async () => {
            savedData = await instanceLabRef.current.save()
        }

        let handleClear = () => {
            instanceRef.current.clear()
        }
        let handleRender = () => {
            if (selectedChapters.type === 'Theory Lab') {
                selectedChapters.text &&
                instanceLabRef.current.isReady.then(() => {
                    instanceLabRef.current.render(selectedChapters.text)
                })
                // instanceLabRef.current.render(selectedChapters.text)
            } else {
                selectedChapters.text &&
                instanceRef.current.render(selectedChapters.text)
            }
        }

        let textSaveButton = () => {
            if (!theoryDetail.intro && selectedChapters.type === 'Theory Intro') {
                return '?????????????????? ??????????'
            } else if (selectedChapters.title && selectedChapters.type === 'Theory Intro') {
                return '???????????????? ??????????'
            } else if (!selectedChapters.title && selectedChapters.type === 'Theory Chapter') {
                return '?????????????????? ??????????'
            } else if (selectedChapters.title && selectedChapters.type === 'Theory Chapter') {
                return '???????????????? ??????????'
            } else if (!selectedChapters.title && selectedChapters.type === 'Theory Lab') {
                return '?????????????????? ????????'
            } else if (selectedChapters.title && selectedChapters.type === 'Theory Lab') {
                return '???????????????? ????????'
            }
        }


        useEffect(() => {
            dispatch(getTheoryDetail(params.id)).then((data: any) => {
                dispatch(isSidebar('theorySidebar'))
                if (!data.payload.intro) {
                    dispatch(setSelectedChapter({type: 'Theory Intro'}))
                } else {
                    dispatch(setSelectedChapter(data.payload.intro))
                }
            })
        }, [])

        useEffect(() => {
            selectedChapters.project && setIsProject(selectedChapters.project)
            selectedChapters.control && setIsControl(selectedChapters.control)
            setMinPoints(selectedChapters.minimum_points)
            selectedChapters.control && setIsControl(selectedChapters.control)
            if (selectedChapters.embed || selectedChapters.clear) {
                setTypeLab(0)
            } else {
                setTypeLab(1)
            }
            if (selectedChapters.isModal) {
                showModal()
            }
            if (selectedChapters.render) {
                handleRender()
            }
            if (selectedChapters.clear) {
                handleClear()
            }
            setValue("title", selectedChapters.title)
            setValue("minimum_points", selectedChapters.minimum_points)
            setValue("embed", selectedChapters.embed)
            setValue("trial", selectedChapters.trial)
            setValue("control", selectedChapters.control)
        }, [selectedChapters])

        useEffect((): any => {
            return () => {
                dispatch(setSelectedChapter(''))
                dispatch(isSidebar('studentSidebar'))
            }
        }, [])
        const showModal = () => {
            setIsModalVisible(true);
        };
        const handleOk = () => {
            setIsModalVisible(false);
        };
        const handleCancel = () => {
            setIsModalVisible(false);
        };

        //Protection to prevent certain roles from accessing the page
        if (permission === 'User' || permission === 'Student' || permission === 'Manager') {
            navigate('/dashboard/')
        }

        if (!selectedChapters.type) {
            return <Preloader/>
        }
        return (
            <div className='createTheory'>
                {/*If this is an intro, then there will be an opportunity to add a photo*/}
                {(!theoryDetail.intro || selectedChapters.type === 'Theory Intro') && <div className="intro">
                    <div className="imgIntro">
                        {imgIntro || selectedChapters.image ?
                            <div className='previewImage'><img src={imgIntro || selectedChapters.image} alt="Banner"/>
                                <div className='changeBanner'>
                                    <div className="content">
                                        <h3>???????????????? ???????????? ??????????</h3>
                                        <p>?????????????????????? ?????????????? 1150 x 275px</p>
                                        <Upload className='upload' {...uploadImgIntro}>
                                            <input type='button' value='????????????????' className='btn'/>
                                        </Upload>
                                        <button className='btn' onClick={() => {
                                            //@ts-ignore
                                            setImgIntro('')
                                        }}>??????????????
                                        </button>
                                    </div>
                                </div>
                            </div> : <div className='installImg'>
                                <div className="content">
                                    <h3>???????????????????? ???????????? ??????????</h3>
                                    <p>?????????????????????? ?????????????? 1150 x 275px</p>
                                    <Upload {...uploadImgIntro}>
                                        <input type='button' value='????????????????' className='btn'/>
                                    </Upload>
                                </div>
                            </div>}
                    </div>
                    <form id="formTheory" className='formTheory' onSubmit={handleSubmit(onSubmitIntro)}>
                        <label className='introTitle'>
                            <input placeholder='????????????????: Computer Science'
                                   className={errors.title && 'errorInput'} {...register("title", {required: true})} />
                        </label>
                    </form>
                </div>}
                {selectedChapters.type === 'Theory Chapter' &&
                <form id="formTheory" className='formTheory' onSubmit={handleSubmit(onSubmitIntro)}>
                    <label className='contentTitle'>
                        <TextareaAutosize placeholder='???????????????? ??????????'
                                          className={errors.title && 'errorInput'}
                                          {...register("title", {required: true})} />
                    </label>
                </form>}
                <div className={selectedChapters.type !== 'Theory Lab' ? 'editor' : 'hideEditor'}>
                    {/*See editorjs.io and www.npmjs.com/package/react-editor-js for details*/}
                    <EditorJs
                        holder='theoryText'
                        readOnly={false}
                        tools={EDITOR_JS_TOOLS}
                        data={selectedChapters.text}
                        instanceRef={(instance) => (instanceRef.current = instance)}
                    >
                        <div id='theoryText'/>
                    </EditorJs>
                </div>
                {selectedChapters.type === 'Theory Lab' && <>
                    <form className='formLab' id="formTheory" onSubmit={handleSubmit(onSubmitLab)}>
                        <label className='contentTitle'>
                            <TextareaAutosize placeholder='???????????????? ????????????????????????'
                                              className={errors.title && 'errorInput'}
                                              {...register("title", {required: true})} />
                        </label>
                        <div className="contentLab">
                            <label className='labType'>
                                <p>?????? ????????:</p>
                                <Switch checkedChildren="Github" unCheckedChildren="Replit"
                                        checked={typeLab === 1 && true} onChange={(e) => {
                                    switchHandler(e)
                                }}/>
                                {typeLab === 0 ? <p>?????????????????? ???????? ???????? ?? Replit ???????????????? MATE</p> :
                                    <p>?????????? ?????????????????? ???????? ???????? ?????????????????? ???????????? ?? ??????????????????????</p>}
                                <span>
                                    <Controller
                                        name="project"
                                        control={control}
                                        defaultValue={isProject}
                                        render={({field}) => (
                                            <input type="checkbox"
                                                   defaultChecked={isProject}
                                                   checked={isProject}
                                                   onChange={(e: any) => {
                                                       field.onChange(e)
                                                       setIsProject(!isProject)
                                                   }}/>
                                        )}
                                    />
                                    <p>?????????????????? ????????????</p>
                                </span>

                            </label>
                            <label className='linkLab'>
                                <p>???????????? ???? ????????:</p>
                                {typeLab === 0 ? <>
                                        <input
                                            placeholder='???????????? ???? ???????????????????????? ???? replit.com' {...register("embed", {required: true})}
                                            defaultValue={selectedChapters.embed}/>
                                        {errors.embed && <span className='error'>???????? ??????????????????????</span>}
                                        <input
                                            placeholder='???????????? ???? ?????????????????? ???????????????????????? ???? replit.com' {...register("trial")}
                                            defaultValue={selectedChapters.trial}/>
                                    </>
                                    : <p>???????????????? ???????? ?????????? ?????????????????????? ???????????? ???? ???????? ??????????????????????</p>}
                            </label>
                            <label className='controlLab'>
                <span>
                <Controller
                    name="control"
                    control={control}
                    defaultValue={isControl}
                    render={({field}) => (
                        <input type="checkbox"
                               defaultChecked={isControl}
                               checked={isControl}
                               onChange={(e: any) => {
                                   field.onChange(e)
                                   setIsControl(!isControl)
                               }}/>
                    )}
                />
                <p>???????????????? ????????????????????????</p>
                </span>
                                <p>???????? ???????????????? ??????????????, ???? ?? ???????????????? ?????????? 1 ??????????????.
                                    ???????? ???????????????? ????????????????, ???? ?? ???????????????? ???????????????????? ?????????????? ???????? ???? ?????????????? ??????????????????????
                                    ????????.
                                </p>
                            </label>
                            {!isControl && <label className='percentageLab'>
                                <p>?????????????????????? ???????? ?????? ??????????????????????:</p>
                                <input type='minimum_points'
                                       defaultValue={selectedChapters.minimum_points} {...register("minimum_points", {required: true,})}/>
                                {errors.minimum_points && <span className='error'>???????? ??????????????????????</span>}
                            </label>}
                        </div>

                        <div className='contentGithub'>
                            {typeLab === 1 && <h2>??????????????:</h2>}
                            <div
                                className={selectedChapters.type === 'Theory Lab' && typeLab === 1 ? 'editor' : 'hideEditor'}>
                                <EditorJs
                                    holder='labText'
                                    readOnly={false}
                                    tools={EDITOR_JS_TOOLS}
                                    data={selectedChapters.text}
                                    instanceRef={(instance) => (instanceLabRef.current = instance)}
                                >
                                    <div id='labText'/>
                                </EditorJs>
                            </div>
                        </div>

                        {/*<button className='btnSubmit' form="formLab" type='submit'>??????????????????</button>*/}
                    </form>
                    <iframe className='lab' allowFullScreen loading="lazy"
                            src={selectedChapters.embed}/>
                </>
                }
                <div className="footerIntro">
                    <div className="line"/>
                    <div className="buttons">
                        <button type='submit' form='formTheory'
                                onClick={() => {
                                    // @ts-ignore
                                    if (selectedChapters.type !== 'Theory Lab') {
                                        handleSaveTheory().then(() => {
                                            setValue('text', savedData && savedData)
                                        })
                                    } else {
                                        typeLab === 1 &&
                                        handleSaveLab().then(() => {
                                            setValue('text', savedData && savedData)
                                        })
                                    }
                                }}>
                            {textSaveButton()}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
)

export default CreateTheory