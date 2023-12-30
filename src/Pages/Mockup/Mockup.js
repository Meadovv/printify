import { useState } from 'react';
import axios from 'axios';
import {
    Button,
    Space,
    InputNumber,
    Checkbox,
    Modal,
    message,
    Input,
} from 'antd';

function SubmitModal({ open, onSubmit, onCancel }) {

    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState(null)

    const uploadImage = async (image) => {
        if (!image) return null
        let imageId = null
        await axios.post('/api/v1/mockup/upload',
            {
                imageName: image.imageName,
                imageLink: image.imageLink
            }).then(res => {
                imageId = res.data.imageId
            }).catch(err => {
                console.log(err)
            })

        return imageId
    }

    const submit = async () => {
        setLoading(true)
        const imageId = await uploadImage(image)
        if (!imageId) {
            message.error('Upload image failed')
        } else {
            onSubmit(imageId)
        }
        setLoading(false)
    }

    return (
        <Modal
            open={open}
            title='Submit'
            onCancel={onCancel}
            onOk={submit}
            okButtonProps={{
                size: 'large',
                loading: loading

            }}
            cancelButtonProps={{
                size: 'large',
                loading: loading
            }}
            width={1000}
        >
            <Space direction='vertical' style={{
                width: '100%'
            }}>
                <Input size='large' addonBefore='Image Name' style={{
                    width: '100%'
                }} onChange={(e) => {
                    setImage({
                        ...image,
                        imageName: e.target.value
                    })
                }} />
                <Input size='large' addonBefore='Image Link' style={{
                    width: '100%'
                }} onChange={(e) => {
                    setImage({
                        ...image,
                        imageLink: e.target.value
                    })
                }} />
            </Space>
        </Modal>
    )
}

export default function Mockup() {

    const [openModal, setModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [variants, setVariants] = useState({
        title: '',
        variantList: []
    })
    const [blueprint, setBlueprint] = useState(null)

    const [productList, setProductList] = useState([])
    const [currentProduct, setCurrentProduct] = useState(0)

    const getVariants = async (blueprint) => {
        if (!blueprint) return
        setLoading(true)
        await axios.post('/api/v1/mockup/variants', {
            blueprintId: blueprint.blueprintId,
            printProviderId: blueprint.printProviderId
        }).then(res => {
            setVariants({
                title: res.data.title,
                variantList: res.data.variants
            })
        }).catch(err => {
            console.log(err)
            setVariants(null)
        })
        setLoading(false)
    }

    const submit = async (imageId) => {
        await axios.post('/api/v1/mockup/create', {
            shopId: 12158758,
            blueprint: blueprint,
            imageId: imageId,
            variants: variants
        }).then(res => {
            if (res.data.success) {
                message.success('Create product success')
                setProductList(res.data.productList)
                setCurrentProduct(0)
            } else {
                message.error(res.data.message)
            }
            setModal(false)
        }).catch(err => {
            console.log(err)
        })
    }

    return (
        <div style={{
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <SubmitModal
                open={openModal}
                onCancel={() => {
                    setModal(false)
                }}
                onSubmit={submit}
            />
            <Space direction='horizontal' style={{
                width: '100%'
            }}>
                <InputNumber min={0} size='large' onChange={(value) => {
                    if (value) {
                        setBlueprint({
                            ...blueprint,
                            blueprintId: value
                        })
                    }
                }} />
                <InputNumber min={0} size='large' onChange={(value) => {
                    if (value) {
                        setBlueprint({
                            ...blueprint,
                            printProviderId: value
                        })
                    }
                }} />
                <Button loading={loading} type='primary' size='large' onClick={() => {
                    getVariants(blueprint)
                }}>Search</Button>

                <Button size='large' type='primary' onClick={() => {
                    setModal(true)
                }}>Submit</Button>
            </Space>
            <div>
                <h1>{variants.title}</h1>
            </div>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap'
            }}>
                {
                    variants.variantList && variants.variantList.map((variant, index) => {
                        return (
                            <div key={index} style={{
                                margin: '1rem',
                                display: 'flex',
                                minWidth: '20rem',
                            }}>
                                <Checkbox checked={variant.isChoose} style={{
                                    marginRight: '0.5rem'
                                }} onChange={(e) => {
                                    const newVariantList = [...variants.variantList]
                                    newVariantList[index].isChoose = e.target.checked
                                    setVariants({
                                        ...variants,
                                        variantList: newVariantList
                                    })
                                }}>
                                    <h3>{variant.title}</h3>
                                </Checkbox>
                            </div>
                        )
                    })
                }
            </div>
            {
                productList.length ?
                    <>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            width: '100%',
                        }}>
                            <h1>Image List</h1>
                            <div style={{
                                width: '30%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <Button size='large' type='primary' onClick={() => {
                                    if (currentProduct !== 0) setCurrentProduct(currentProduct => currentProduct - 1)
                                }}>Previous</Button>
                                <div>
                                    {currentProduct + 1} / {productList.length}
                                </div>
                                <Button size='large' type='primary' onClick={() => {
                                    if (currentProduct !== productList.length - 1) setCurrentProduct(currentProduct => currentProduct + 1)
                                }}>Next</Button>
                            </div>
                        </div>
                        <div style={{
                            width: '100%',
                            display: 'flex-wrap',
                            flexWrap: 'wrap',
                        }}>
                            {
                                productList[currentProduct].images.map((image, index) => {

                                    return (
                                        <img src={productList[currentProduct].images[index].src} alt='big' style={{
                                            width: '20%',
                                            height: 'auto'
                                        }} key={index}/>
                                    )
                                })
                            }
                        </div></> : <></>
            }
        </div>
    );
}