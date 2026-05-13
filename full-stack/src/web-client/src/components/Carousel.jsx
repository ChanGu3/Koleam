import { useState, useEffect } from "react";
import "../tailwind.css";

// Object Data Of Carousel Item
export const CarouselItemObject = function (logoImage, description, src, href) {
  this.logoImage = logoImage;
  this.description = description;
  this.src = src;
  this.href = href;

  return this;
};

// Carousel Item Containing image
function CarouselItem({ index, item, currCarouselIndex, prevCarouselIndex }) {
  return (
    <a
      className={`${index === currCarouselIndex ? "animate-fade-in" : index === prevCarouselIndex ? "animate-fade-out" : "hidden"}`}
      href={item.href}
    >
      <div className="z-40 absolute left-[12vw] top-[25vw] bg-os-dark-tertiary/40 rounded-sm p-1 w-48 md:w-128 flex flex-col justify-start">
        <p className="md:p-1 text-os-white font-bold text-lf md:text-4xl">
          {item.logoImage}
        </p>
        <p className="p-0.5 md:p-2 text-os-white/95 font-semibold text-[6px] md:text-xs h-[30px] md:h-[60px] line-clamp-3 md:line-clamp-3">
          {item.description}
        </p>
      </div>
      <div className="absolute flex justify-center w-full h-full -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-30 [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]">
        <img src={item.src} className="absolute w-full h-full" alt={""} />
      </div>
    </a>
  );
}

// Carousel Item Loading Box
function CarouselSelect({
  index,
  SlideToElement,
  currCarouselIndex,
  SlideRight,
}) {
  return (
    <button
      type="button"
      onClick={() => {
        SlideToElement(index);
      }}
      className={`cursor-pointer rounded-xs bg-os-dark-secondary hover:bg-os-dark-secondary/75 ${index === currCarouselIndex ? "w-full" : "w-1/4"}`}
    >
      <div
        className={`origin-left h-full w-full ${index === currCarouselIndex ? "bg-os-white hover:bg-os-white/75 animate-fill-from-left" : ""}`}
        onAnimationEnd={SlideRight}
      ></div>
    </button>
  );
}

/* Main Carousel */
function Carousel({ carouselList }) {
  const [{ currCarouselIndex, prevCarouselIndex }, SetCarouselIndexes] =
    useState(() => ({ currCarouselIndex: 0, prevCarouselIndex: -1 }));

  const carouselMaxCount = 6;

  /* REPLACE THIS LIST WITH DATA FROM DATABASE */
  /*                                           */
  /*                                           */
  /*                                           */
  /*                                           */
  /*                                           */

  const currentCarouselData = carouselList.slice(0, carouselMaxCount + 1);

  /* Carousel Setup */
  useEffect(() => {
    CarouselInit();
  }, []);

  function CarouselInit() {
    if (currentCarouselData.length === 1) /* Remove Slider Controls */
    {
      document.getElementById("left-slider").classList.add("hidden");
      document.getElementById("right-slider").classList.add("hidden");
      document.getElementById("slider-indicators").classList.add("hidden");
    } else if (currentCarouselData.length === 0) /* Removes Entire Carousel */
    {
      document.getElementById("indicators-carousel").classList.add("hidden");
    }
  }

  function SlideLeft() {
    currCarouselIndex !== 0
      ? SlideToElement(currCarouselIndex - 1)
      : SlideToElement(currentCarouselData.length - 1);
  }

  function SlideRight() {
    currCarouselIndex !== currentCarouselData.length - 1
      ? SlideToElement(currCarouselIndex + 1)
      : SlideToElement(0);
  }

  function SlideToElement(index) {
    SetCarouselIndexes({
      currCarouselIndex: index,
      prevCarouselIndex: currCarouselIndex,
    });
  }

  return (
    <>
      <div id="indicators-carousel" className="relative w-full">
        {/* <!-- Carousel wrapper -->*/}
        <div
          id="carousel-wrapper"
          className="relative w-full aspect-video md:overflow-hidden"
        >
          {currentCarouselData.map((item, index) => {
            return (
              <CarouselItem
                key={index}
                index={index}
                item={item}
                currCarouselIndex={currCarouselIndex}
                prevCarouselIndex={prevCarouselIndex}
              />
            );
          })}
        </div>

        {/*<!-- Carousel indicators -->*/}
        <div
          id="slider-indicators"
          className="py-1 px-2 absolute z-30 flex justify-between bottom-[3vw] left-[8vw] rounded-sm gap-x-1 min-w-48 min-h-4"
        >
          {currentCarouselData.map((item, index) => {
            return (
              <CarouselSelect
                key={index}
                index={index}
                currCarouselIndex={currCarouselIndex}
                SlideToElement={SlideToElement}
                SlideRight={SlideRight}
              />
            );
          })}
        </div>

        {/*<!-- Carousel controls -->*/}
        <button
          id="left-slider"
          type="button"
          onClick={SlideLeft}
          className="absolute top-0 start-0 z-30 flex items-center justify-center h-full pl-1 md:pl-5 pr-1 cursor-pointer group focus:outline-none "
        >
          <span className="inline-flex items-center justify-center w-5 h-5  md:w-10 md:h-10 rounded-xs bg-os-blue-tertiary/50 group-hover:bg-os-blue-tertiary/80 group-focus:ring-2 md:group-focus:ring-4 group-focus:ring-os-white/80 group-focus:outline-none">
            <svg
              className="w-2 h-2 md:w-4 md:h-4 text-os-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 1 1 5l4 4"
              />
            </svg>
            <span className="sr-only">Previous</span>
          </span>
        </button>
        <button
          id="right-slider"
          type="button"
          onClick={SlideRight}
          className="absolute top-0 end-0 z-30 flex items-center justify-center h-full pr-1 md:pr-5 pl-1 cursor-pointer group focus:outline-none "
          data-carousel-next
        >
          <span className="inline-flex items-center justify-center w-5 h-5  md:w-10 md:h-10 rounded-xs bg-os-blue-tertiary/50 group-hover:bg-os-blue-tertiary/80 group-focus:ring-2 md:group-focus:ring-4 group-focus:ring-os-white/80 group-focus:outline-none">
            <svg
              className="w-2 h-2 md:w-4 md:h-4 text-os-white dark:text-gray-800 rtl:rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
            <span className="sr-only">Next</span>
          </span>
        </button>
      </div>
    </>
  );
}

export default Carousel;
