import {useMutation } from '@tanstack/react-query';
import { connectToFacebook } from '../api/facebookApi';

export const useConnectToFacebook = () => {

    const fbConnection = useMutation({
        mutationFn: connectToFacebook,
        
    })

    return {
        fbConnection
    }
}