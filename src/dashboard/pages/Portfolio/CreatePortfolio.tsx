import {useEffect, useState} from "react";
import {message, Modal, Upload} from "antd";
import {SubmitHandler, useForm} from "react-hook-form";
import plus from "../../../assets/image/plus.png";
import {useAppDispatch, useAppSelector} from "../../../redux/hooks";
import {useTranslation} from "react-i18next";
import {getPortfolioSelector} from "../../../redux/selectors/usersSelectors";
import {getPortfolio, PortfolioType, postPortfolio,} from "../../../redux/reducers/usersReducer";
import "./CreatePortfolio.scss";
import Preloader from "../../../landing/components/Preloader/Preloader";

const CreatePortfolio = () => {
    const dispatch = useAppDispatch();
    const {t} = useTranslation();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [stateCard, setStateCard] = useState<any>("");
    const [siteImg, setSiteImg] = useState();
    const [siteImgFile, setSiteImgFile] = useState();

    const portfolio = useAppSelector((state) => getPortfolioSelector(state));

    let request: any = {};

    const uploadImgPartner = {
        accept: ".png, .jpg, .jpeg",
        showUploadList: false,
        name: "file",
        multiple: false,
        customRequest: (file: any) => {
            setSiteImgFile(file.file);
            let reader: any = new FileReader();
            let url = reader.readAsDataURL(file.file);
            reader.onloadend = () => {
                setSiteImg(reader.result);
            };
        },
    };

    const {
        register,
        handleSubmit,
        setValue,
        formState: {errors},
    } = useForm({
        defaultValues: stateCard,
    });
    const showModal = () => {
        setIsModalVisible(true);
    };
    const handleOk = () => {
        setIsModalVisible(false);
    };
    const handleCancel = () => {
        setIsModalVisible(false);
        setValue("title", "");
        setValue("description", "");
        setValue("link", "");
    };

    const onSubmit: SubmitHandler<PortfolioType> = (data): any => {
        request = {...data};
        request.photo = siteImgFile;
        dispatch(postPortfolio(request)).then(() => {
            console.log(request)
            dispatch(getPortfolio());
            message.success("???????? ????????????????");
            setIsModalVisible(false);
        });
    };

    useEffect(() => {
        dispatch(getPortfolio());
    }, []);

    useEffect(() => {
        setValue("title", stateCard.title);
        setSiteImg(stateCard.photo);
    }, [stateCard]);
    if (!portfolio) {
        return <Preloader/>
    }
    return (
        <div className="createPortfolio">
            <h2 className="title">?????????????? ??????????????????</h2>
            <p>
                ?????????? ???? ???????????? ?????????????????? ???????? ????????????. ?????? ?????????? ???????????????????????? ???? ??????????????
                ???????????????? IT-ACADEMY!
            </p>
            <div className="portfolioGrid">
                {portfolio ? (
                    portfolio.map((p, key: number) => (
                        <div key={key} className="portfolio">
                            <img src={p.photo} alt="Site"/>
                            <h2>{p.title}</h2>
                        </div>
                    ))
                ) : (
                    <div>{t("noCourses")}</div>
                )}
                <div
                    onClick={() => {
                        setStateCard("");
                        showModal();
                    }}
                    className="newCourse"
                >
                    <img src={plus} alt="Create Course"/>
                </div>
            </div>
            <Modal
                title="?????????????? ??????????????????"
                className="modal"
                width={500}
                visible={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <form className="partnersModal" onSubmit={handleSubmit(onSubmit)}>
                    <label className="partnerName">
                        <p>???????????????? ??????????:</p>
                        <input
                            placeholder="IT-Academy"
                            {...register("title", {required: false})}
                        />
                    </label>
                    <label className="partnerLink">
                        <p>???????????? ???? ????????:</p>
                        <input
                            placeholder="https://"
                            {...register("url", {required: false})}
                        />
                    </label>
                    <label className="partnerDescription">
                        <p>???????? ????????????????????:</p>
                        <input
                            placeholder="JS, React, Vue"
                            {...register("stack", { required: false })}
                        />
                    </label>
                    <div className="imgLms">
                        {siteImg ? (
                            <div className="previewImage">
                                <img src={siteImg} alt="Banner"/>
                                <div className="changeBanner">
                                    <div className="content">
                                        <h3>???????????????? ???????? ??????????</h3>
                                        <p>?????????????????????? ?????????????? 325 x 185px</p>
                                        <Upload className="upload" {...uploadImgPartner}>
                                            <input type="button" value="????????????????" className="btn"/>
                                        </Upload>
                                        <button
                                            className="btn"
                                            onClick={() => {
                                                //@ts-ignore
                                                setSiteImg("");
                                            }}
                                        >
                                            ??????????????
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="installImg">
                                <div className="content">
                                    <h3>???????????????????? ???????? ??????????</h3>
                                    <p>?????????????????????? ?????????????? 325 x 185px</p>
                                    <Upload {...uploadImgPartner}>
                                        <input type="button" value="????????????????" className="btn"/>
                                    </Upload>
                                </div>
                            </div>
                        )}
                    </div>
                    <button className="btnSubmit" type="submit">
                        ??????????????????
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default CreatePortfolio;
