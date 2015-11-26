namespace CRM_Experiments
{

    public enum its_ReserveRequestStatusCode
    {
        //- Новый
        New = 0,
        //- Обрабатывается пресейлом
        InProgress = 1,
        //- Обработан
        Completed = 2,
        //- Отменен
        Canceled = 99
    }
}
