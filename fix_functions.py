import sys

def modify():
    with open('apps/web/src/pages/foc/FreeOfCostClaims.jsx', 'r') as f:
        content = f.read()

    old_code = """    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this claim?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/foc-claims/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete claim');
            fetchClaims();
        } catch (err) {
            alert(err.message);
        }
    };"""

    new_code = old_code + """

    const handleOpenAnnexModal = (annex = null) => {
        if (annex) {
            setEditingAnnex(annex);
            setAnnexNumber(annex.AnnexNumber);
            setInvoiceNumber(annex.InvoiceNumber || '');
            setAnnexClaimAmount(annex.ClaimAmount || '');
            setPostService(annex.PostService || '');
            setConsignmentNumber(annex.ConsignmentNumber || '');
            setPostDate(annex.PostDate ? annex.PostDate.split('T')[0] : '');
        } else {
            setEditingAnnex(null);
            setAnnexNumber('');
            setInvoiceNumber('');
            setAnnexClaimAmount('');
            setPostService('');
            setConsignmentNumber('');
            setPostDate('');
        }
        setShowAnnexModal(true);
    };

    const handleAnnexSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const method = editingAnnex ? 'PUT' : 'POST';
            const url = editingAnnex
                ? `${apiUrl}/annexures/${encodeURIComponent(editingAnnex.AnnexNumber)}`
                : `${apiUrl}/annexures`;

            const payload = {
                AnnexNumber: annexNumber,
                InvoiceNumber: invoiceNumber,
                ClaimAmount: annexClaimAmount ? parseFloat(annexClaimAmount) : null,
                PostService: postService,
                ConsignmentNumber: consignmentNumber,
                PostDate: postDate || null
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Failed to save annexure');
            setShowAnnexModal(false);
            fetchAnnexures();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAnnexDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this annexure?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${apiUrl}/annexures/${encodeURIComponent(id)}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete annexure');
            fetchAnnexures();
        } catch (err) {
            alert(err.message);
        }
    };"""

    content = content.replace(old_code, new_code)

    with open('apps/web/src/pages/foc/FreeOfCostClaims.jsx', 'w') as f:
        f.write(content)

modify()
