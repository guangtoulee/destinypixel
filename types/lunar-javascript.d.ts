declare module "lunar-javascript" {
  export const Solar: {
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): {
      getLunar(): {
        getYearInGanZhi(): string;
        getYearInGanZhiExact(): string;
        getMonthInGanZhi(): string;
        getMonthInGanZhiExact(): string;
        getDayInGanZhi(): string;
        getTimeInGanZhi(): string;
        getEightChar(): {
          setSect(sect: 1 | 2): void;
          getYear(): string;
          getMonth(): string;
          getDay(): string;
          getTime(): string;
        };
      };
    };
  };
}
