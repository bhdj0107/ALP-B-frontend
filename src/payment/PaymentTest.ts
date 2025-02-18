import axios from 'axios';
import { useToast } from 'vue-toastification';
import router from '@/router';

const toast = useToast();

export const onPayment = async (
    reservationId: string,
    amount: number,
    itemName: string,
    buyerName: string,
    buyerEmail: string,
) => {
    try {
        // 1. 결제 준비 요청
        const merchantUid = `mid${reservationId.padStart(6, '0')}${new Date().getTime()}`;
        const prepareResponse = await axios.post('/payments/prepare', {
            merchantUid,
            reservationId,
            amount,
            type: 'card',
            name: buyerName,
            email: buyerEmail
        });

        // 2. 결제 모듈 호출
        const { IMP } = (window as any);
        IMP.init('imp06425121');  // 실제 아임포트 키로 변경

        const response = await new Promise((resolve, reject) => {
            IMP.request_pay({
                pg: 'uplus',
                pay_method: 'card',
                merchant_uid: merchantUid,
                name: itemName,
                amount: amount,
                buyer_email: buyerEmail,
                buyer_name: buyerName,
            }, (rsp: any) => {
                if (rsp.success) {
                    resolve(rsp);
                } else {
                    reject(new Error(rsp.error_msg));
                }
            });
        });

        // 3. 결제 완료 요청
        await axios.post('/payments/complete', {
            merchantUid,
            status: 'SUCCESS',
            approvalNumber: (response as any).imp_uid,
            approvedAt: new Date()
        });

        toast.success('결제가 완료되었습니다.');
        
        // 결제 성공 시 예약 내역 페이지로 리다이렉트
        router.push('/mypage');
        return true;
        
    } catch (error: any) {
        // 결제 실패 처리
        if (error.response?.data?.merchantUid) {
            await axios.post('/payments/complete', {
                merchantUid: error.response.data.merchantUid,
                status: 'FAILED'
            });
        }
        toast.error('결제에 실패했습니다.');
        
        // 현재 페이지 새로고침
        window.location.reload();
        return false;
    }
};
