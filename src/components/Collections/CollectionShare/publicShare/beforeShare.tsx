import { Box, Typography } from '@mui/material';
import { GalleryContext } from 'pages/gallery';
import { AppContext } from 'pages/_app';
import React, { useContext, useState } from 'react';
import {
    createShareableURL,
    deleteShareableURL,
    updateShareableURL,
} from 'services/collectionService';
import { Collection, PublicURL, UpdatePublicURL } from 'types/collection';
import { handleSharingErrors } from 'utils/error/ui';
import constants from 'utils/strings/constants';
import { EnteMenuItem } from 'components/Menu/menuItem';
interface Iprops {
    publicShareProp;
    collection: Collection;
    publicShareActive: boolean;
    setPublicShareProp: (value: PublicURL) => void;
    setIsFirstShareProp: (value: boolean) => void;
}
import LinkIcon from '@mui/icons-material/Link';

export default function BeforeShare({
    collection,
    publicShareActive,
    setPublicShareProp,
    setIsFirstShareProp,
}: Iprops) {
    const appContext = useContext(AppContext);
    const galleryContext = useContext(GalleryContext);
    const [sharableLinkError, setSharableLinkError] = useState(null);

    const createSharableURLHelper = async () => {
        try {
            appContext.startLoading();
            const publicURL = await createShareableURL(collection);
            setPublicShareProp(publicURL);
            await galleryContext.syncWithRemote(false, true);
        } catch (e) {
            const errorMessage = handleSharingErrors(e);
            setSharableLinkError(errorMessage);
        } finally {
            appContext.finishLoading();
        }
    };

    const disablePublicSharing = async () => {
        try {
            appContext.startLoading();
            await deleteShareableURL(collection);
            setPublicShareProp(null);
            await galleryContext.syncWithRemote(false, true);
        } catch (e) {
            const errorMessage = handleSharingErrors(e);
            setSharableLinkError(errorMessage);
        } finally {
            appContext.finishLoading();
        }
    };

    const confirmDisablePublicSharing = () => {
        appContext.setDialogMessage({
            title: constants.DISABLE_PUBLIC_SHARING,
            content: constants.DISABLE_PUBLIC_SHARING_MESSAGE,
            close: { text: constants.CANCEL },
            proceed: {
                text: constants.DISABLE,
                action: disablePublicSharing,
                variant: 'danger',
            },
        });
    };
    const updatePublicShareURLHelper = async (req: UpdatePublicURL) => {
        try {
            galleryContext.setBlockingLoad(true);
            const response = await updateShareableURL(req);
            setPublicShareProp(response);
        } catch (e) {
            const errorMessage = handleSharingErrors(e);
            setSharableLinkError(errorMessage);
        } finally {
            galleryContext.setBlockingLoad(false);
        }
    };
    const handleCollectionPublicSharing = () => {
        setSharableLinkError(null);
        updatePublicShareURLHelper({
            collectionID: collection.id,
            enableCollect: false,
        });
        if (publicShareActive) {
            confirmDisablePublicSharing();
            setIsFirstShareProp(false);
        } else {
            createSharableURLHelper();
            setIsFirstShareProp(true);
        }
    };
    const handleCollecPhotosPublicSharing = () => {
        setSharableLinkError(null);
        updatePublicShareURLHelper({
            collectionID: collection.id,
            enableCollect: true,
        });
        if (publicShareActive) {
            confirmDisablePublicSharing();
            setIsFirstShareProp(false);
        } else {
            createSharableURLHelper();
            setIsFirstShareProp(true);
        }
    };
    return (
        <Box mt={3}>
            <EnteMenuItem
                startIcon={<LinkIcon />}
                endIcon={<LinkIcon />}
                subText="never"
                color="primary"
                onClick={handleCollectionPublicSharing}>
                {constants.CREATE_PUBLIC_SHARING}
            </EnteMenuItem>
            <EnteMenuItem
                startIcon={<LinkIcon />}
                color="primary"
                onClick={handleCollecPhotosPublicSharing}>
                {constants.COLLECT_PHOTOS}
            </EnteMenuItem>
            {sharableLinkError && (
                <Typography
                    textAlign={'center'}
                    variant="body2"
                    sx={{
                        color: (theme) => theme.palette.danger.main,
                        mt: 0.5,
                    }}>
                    {sharableLinkError}
                </Typography>
            )}
        </Box>
    );
}
