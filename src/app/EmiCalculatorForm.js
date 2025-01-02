'use client';
import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField
} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment/moment';

const EmiCalculatorForm = () => {
    const {control, handleSubmit} = useForm({
        defaultValues: {
            loanAmount: '0',
            loanTenure: '0',
            interestRate: '0.0',
            startDate: moment()
        }
    });
    const [emiBreakdownList, setEmiBreakdownList] = React.useState([]);

    const onSubmit = (data) => {
        const principal = parseFloat(data.loanAmount);
        const loanTenure = parseInt(data.loanTenure);
        const annualRate = parseFloat(data.interestRate);
        const startDate = moment(data.startDate);
        const prepayments = [
            {month: 12, amount: 50000}
        ];

        const emiBreakdown = calculateEMIBreakdownWithPrepaymentFixedEMI(principal, annualRate, 27567, prepayments);
        setEmiBreakdownList(emiBreakdown);

        console.log('Month\tEMI\t\tInterest\tPrincipal\tRemaining Principal');
        emiBreakdown.forEach(detail => {
            console.log(
                `${detail.month}\t₹${detail.emi}\t₹${detail.interest}\t₹${detail.principal}\t₹${detail.remainingPrincipal}`
            );
        });
    }

    function calculateEMIBreakdown(principal, annualRate, tenureMonths) {
        // Convert annual rate to monthly and in decimal
        const monthlyRate = annualRate / (12 * 100);
        let remainingPrincipal = principal;
        let breakdown = [];

        for (let month = 1; month <= tenureMonths; month++) {
            // EMI formula calculation
            const emi = (remainingPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths - month + 1)) /
                (Math.pow(1 + monthlyRate, tenureMonths - month + 1) - 1);

            // Calculate interest and principal components
            const interestComponent = remainingPrincipal * monthlyRate;
            const principalComponent = emi - interestComponent;

            // Update remaining principal
            remainingPrincipal -= principalComponent;

            // Store the breakdown for this month
            breakdown.push({
                month: month,
                emi: emi.toFixed(2),
                interest: interestComponent.toFixed(2),
                principal: principalComponent.toFixed(2),
                remainingPrincipal: remainingPrincipal > 0 ? remainingPrincipal.toFixed(2) : '0.00'
            });

            // Stop if the loan is fully repaid
            if (remainingPrincipal <= 0) {
                break;
            }
        }

        return breakdown;
    }

    function calculateEMIBreakdownWithPrepayment(principal, annualRate, tenureMonths, prepayments = []) {
        // Convert annual rate to monthly and in decimal
        const monthlyRate = annualRate / (12 * 100);
        let remainingPrincipal = principal;
        let breakdown = [];

        for (let month = 1; month <= tenureMonths; month++) {
            // EMI formula calculation
            const emi = (remainingPrincipal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths - month + 1)) /
                (Math.pow(1 + monthlyRate, tenureMonths - month + 1) - 1);

            // Calculate interest and principal components
            const interestComponent = remainingPrincipal * monthlyRate;
            const principalComponent = emi - interestComponent;

            // Update remaining principal
            remainingPrincipal -= principalComponent;

            // Check for prepayment in this month
            const prepayment = prepayments.find(p => p.month === month);
            if (prepayment) {
                remainingPrincipal -= prepayment.amount;
            }

            // Store the breakdown for this month
            breakdown.push({
                month: month,
                emi: emi.toFixed(2),
                interest: interestComponent.toFixed(2),
                principal: principalComponent.toFixed(2),
                prepayment: prepayment ? prepayment.amount.toFixed(2) : '0.00',
                remainingPrincipal: remainingPrincipal > 0 ? remainingPrincipal.toFixed(2) : '0.00'
            });

            // Stop if the loan is fully repaid
            if (remainingPrincipal <= 0) {
                break;
            }
        }

        return breakdown;
    }

    function calculateEMIBreakdownWithPrepaymentFixedEMI(principal, annualRate, emi = 27567, prepayments = []) {
        // Convert annual rate to monthly and in decimal
        const monthlyRate = annualRate / (12 * 100);
        let remainingPrincipal = principal;
        let breakdown = [];
        let month = 0;

        while (remainingPrincipal > 0) {
            month++;

            // Calculate interest and principal components
            const interestComponent = remainingPrincipal * monthlyRate;
            const principalComponent = emi - interestComponent;

            // Update remaining principal
            remainingPrincipal -= principalComponent;

            // Check for prepayment in this month
            const prepayment = prepayments.find(p => p.month === month);
            if (prepayment) {
                remainingPrincipal -= prepayment.amount;
            }

            // Store the breakdown for this month
            breakdown.push({
                month: month,
                emi: emi.toFixed(2),
                interest: interestComponent.toFixed(2),
                principal: principalComponent.toFixed(2),
                prepayment: prepayment ? prepayment.amount.toFixed(2) : '0.00',
                remainingPrincipal: remainingPrincipal > 0 ? remainingPrincipal.toFixed(2) : '0.00'
            });

            // Stop if the loan is fully repaid
            if (remainingPrincipal <= 0) {
                break;
            }
        }

        return breakdown;
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>
                <h4>Basic Info</h4>
                <section className="basicInfo">
                    <Controller name="loanAmount"
                                control={control}
                                render={({field}) =>
                                    <TextField {...field}
                                               label="Loan Amount"
                                               type="text"/>}/>
                    <Controller name="loanTenure"
                                control={control}
                                render={({field}) =>
                                    <TextField {...field}
                                               label="Loan Tenure"
                                               type="text"/>}/>
                    <Controller name="interestRate"
                                control={control}
                                render={({field}) =>
                                    <TextField {...field}
                                               label="Interest Rate"
                                               type="text"/>}/>
                    <Controller name="startDate"
                                control={control}
                                render={({field}) =>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker {...field}
                                                    label="Start Date"/>
                                    </LocalizationProvider>}/>
                </section>
                <section>
                    <h4>Prepayment</h4>
                    <Controller name="prepayment"
                                control={control}
                                render={({field}) =>
                                    <TextField {...field}
                                               label="Prepayment"
                                               type="text"/>}/>
                    <Controller name="monthlyPrepaymentStartDate"
                                control={control}
                                render={({field}) =>
                                    <LocalizationProvider dateAdapter={AdapterMoment}>
                                        <DatePicker {...field}
                                                    label="Monthly Prepayment Start Date"/>
                                    </LocalizationProvider>}/>
                </section>
                <section>
                    <Button type="submit" variant="contained">Calculate</Button>
                </section>
            </form>
            <section>
                <h4>EMI Breakdown</h4>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell>EMI</TableCell>
                                <TableCell>Interest</TableCell>
                                <TableCell>Principal</TableCell>
                                <TableCell>Prepayment</TableCell>
                                <TableCell>Remaining Principal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {emiBreakdownList.map(detail => (
                                <TableRow key={detail.month}>
                                    <TableCell>{detail.month}</TableCell>
                                    <TableCell>₹{detail.emi}</TableCell>
                                    <TableCell>₹{detail.interest}</TableCell>
                                    <TableCell>₹{detail.principal}</TableCell>
                                    <TableCell>₹{detail.prepayment}</TableCell>
                                    <TableCell>₹{detail.remainingPrincipal}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </section>
        </>
    );
};

export default EmiCalculatorForm;